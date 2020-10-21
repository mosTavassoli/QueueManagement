<?php
require_once "../vendor/autoload.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json");

define("API_PATH", "/API/REST.php");

define("START_OF_DISPLAY_ID", 1); //this is the display id that will be used as start each day

/* Functions that implements endpoints */
if (!function_exists("create_new_ticket")) {

	/**
	 * Create a new ticket. Will take informations from $_POST
	 * 
	 * @return void
	 */
	function create_new_ticket($vars) {
		$service_id = $_POST["serviceID"];
		try {
			$db = new SQLite3("../db.sqlite");
			//checking if the service exists
			$statement = $db->prepare("SELECT COUNT(*) FROM services WHERE ID = :serviceId");
			$statement->bindValue(":serviceId", $service_id, SQLITE3_INTEGER);
			$result = $statement->execute();

			if ($result === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			$value = $result->fetchArray(SQLITE3_NUM);

			if (intval($value[0]) <= 0) {
				echo json_encode(array("success" => false, "reason" => "Service not available"));
				return;
			}

			//getting the most recent display_id. This way is definitely not parallel safe
			//but using SQLite means you don't give a single f* of parallelism
			$value = $db->querySingle("SELECT ts_create, display_id FROM tickets ORDER BY ts_create DESC LIMIT 1", true);
			if ($value === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			if (empty($value)) $new_ticket_display_id = START_OF_DISPLAY_ID;
			else {
				$last_ticket_date = date("Y-m-d", $value["ts_create"]);
				$new_ticket_display_id = $last_ticket_date != date("Y-m-d") ? START_OF_DISPLAY_ID : intval($value["display_id"]) + 1;
			}

			//create the ticket

			$statement = $db->prepare("INSERT INTO tickets (display_id, service_id, ts_create) VALUES (:displayId, :serviceId, :creationTs)");
			$statement->bindValue(":displayId", $new_ticket_display_id, SQLITE3_INTEGER);
			$statement->bindValue(":serviceId", $service_id, SQLITE3_INTEGER);
			$statement->bindValue(":creationTs", time(), SQLITE3_INTEGER);
			$result = $statement->execute();
			if ($result === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			//getting the length of the queue
			//checking if the service exists
			$statement = $db->prepare("SELECT COUNT(*) FROM tickets WHERE service_id = :serviceId AND ts_served IS NULL");
			$statement->bindValue(":serviceId", $service_id, SQLITE3_INTEGER);
			$result = $statement->execute();

			if ($result === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			$value = $result->fetchArray(SQLITE3_NUM);
			$queue_length = $value[0];

			echo json_encode(array("success" => true, "displayId" => $new_ticket_display_id, "ticketId" => $db->lastInsertRowID(), "serviceId" => intval($service_id), "queueLength" => $queue_length));

			$db->close();
		} catch (Exception $e) {
			echo json_encode(array("success" => false, "reason" => $e->getMessage()));
		}
	}
}

if (!function_exists('serve_ticket')) {

	function serve_ticket($vars) {


		try {
			// Get counter id from query
			$counterId = null;
			if (isset($_GET['counterId'])) {
				$counterId = $_GET['counterId'];
			} else {
				throw new Error("counterId not set in URL query");
			}

			$db = new SQLite3('../db.sqlite');
			// Get counter from db
			$statement = $db->prepare('SELECT * FROM USERS WHERE ID = :counterId');
			$statement->bindValue(":counterId", $counterId, SQLITE3_INTEGER);
			$result = $statement->execute();

			if ($result === false) {
				throw new Error($db->lastErrorCode(), $db->lastErrorCode());
			}

			$counter = $result->fetchArray(SQLITE3_ASSOC);

			// Extract serviceIds associated to counter
			$services = explode(',', $counter['comma_services']);

			// Extract service times
			$expected_s = array();
			$statement = $db->prepare('SELECT ID, expected_s FROM SERVICES');
			$result = $statement->execute();
			while ($time = $result->fetchArray(SQLITE3_ASSOC)) {
				$expected_s[$time['ID']] = $time['expected_s'];
			}

			// Extract queue for each service
			$queues = array();
			foreach ($services as $s) {
				$statement = $db->prepare('SELECT * FROM TICKETS WHERE SERVICE_ID = :serviceId AND COUNTER_ID IS NULL AND TS_SERVED IS NULL ORDER BY TS_CREATE ASC');
				$statement->bindValue(":serviceId", intval($s), SQLITE3_INTEGER);
				$result = $statement->execute();

				if ($result === false) {
					throw new Error($db->lastErrorCode(), $db->lastErrorCode());
				}

				$queues[$s] = array();
				while ($t = $result->fetchArray(SQLITE3_ASSOC)) {
					array_push($queues[$s], $t);
				}
			}

			if (count($queues) > 0) {
				// Order queues, index 0 will be popped
				usort($queues, function ($a, $b) use ($expected_s) {
					if (count($a) > 0 && count($b) > 0 && count($a) === count($b)) {
						return $expected_s[$b[0]['service_id']] - $expected_s[$a[0]['service_id']];
					} else {
						return count($b) - count($a);
					}
				});

				// Pop first queue
				$queue = $queues[0];
				if (count($queue) <= 0) {
					echo json_encode(array('ticketId' => null, 'displayId' => null, 'serviceId' => null));
				} else {
					$ticket_to_serve = $queues[0][0];

					// Update selected ticket on db
					$statement = $db->prepare('UPDATE TICKETS SET COUNTER_ID = :counterId, TS_SERVED = :tsServed WHERE ID = :ticketId');
					$statement->bindValue(":counterId", intval($counterId), SQLITE3_INTEGER);
					$statement->bindValue(":tsServed", time(), SQLITE3_INTEGER);
					$statement->bindValue(":ticketId", intval($ticket_to_serve['ID']), SQLITE3_INTEGER);
					$result = $statement->execute();
					if ($result === false) {
						throw new Error($db->lastErrorCode(), $db->lastErrorCode());
					}
					echo json_encode(array('ticketId' => $ticket_to_serve['ID'], 'displayId' => $ticket_to_serve['display_id'], 'serviceId' => $ticket_to_serve['service_id']));
				}
			} else {
				echo json_encode(array('ticketId' => null, 'displayId' => null, 'serviceId' => null));
			}
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		} finally {
			$db->close();
		}
	}
}

/*Documentation for FastRoute can be found here: https://github.com/nikic/FastRoute */

//define the routes
$dispatcher = FastRoute\simpleDispatcher(function (FastRoute\RouteCollector $r) {
	$r->addRoute('POST', API_PATH . "/ticket", "create_new_ticket");
	$r->addRoute('GET', API_PATH . '/ticket', 'serve_ticket');
});

// Fetch method and URI from somewhere
$httpMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Strip query string (?foo=bar) and decode URI
if (false !== $pos = strpos($uri, '?')) {
	$uri = substr($uri, 0, $pos);
}
$uri = rawurldecode($uri);

$routeInfo = $dispatcher->dispatch($httpMethod, $uri);
switch ($routeInfo[0]) {
	case FastRoute\Dispatcher::NOT_FOUND:
		http_response_code(404);
		break;
	case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
		$allowedMethods = $routeInfo[1];
		http_response_code(405);
		// ... 405 Method Not Allowed
		break;
	case FastRoute\Dispatcher::FOUND:
		$handler = $routeInfo[1];
		$vars = $routeInfo[2];
		$handler($vars);
		break;
}
