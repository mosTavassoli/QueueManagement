<?php
require_once "../vendor/autoload.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json");

define("API_PATH", "/API/REST.php");
//define("API_PATH", "/sfteng/office-queue/server/API/REST.php");

define("START_OF_DISPLAY_ID", 1); //this is the display id that will be used as start each day

/* Turning warning and notices into exceptions */

set_error_handler(function($errno, $errstr, $errfile, $errline, $errcontext) {
    // error was suppressed with the @-operator
    if (0 === error_reporting()) {
        return false;
    }

    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});


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

if (!function_exists('get_tickets')) {
	function get_tickets($vars) {
		if (isset($_GET['toserve'])) {

			// Get counter id from query
			$counterId = null;
			if (isset($_GET['counterId'])) {
				$counterId = $_GET['counterId'];
			} else {
				echo json_encode(array("success" => false, "reason" => "Expected parameter counterId in URL query"));
				return;
			}

			serve_ticket(intval($counterId));
		} else if (isset($_GET['served'])) {
			// Get count from query
			$count = 50;
			if (isset($_GET['count'])) {
				$count = $_GET['count'];
			}

			list_served_tickets(intval($count));
		} else {
			echo json_encode(array("success" => false, "reason" => 'Expected parameter toserve or served in URL query'));
		}
	}
}

if (!function_exists('serve_ticket')) {

	function serve_ticket($counterId) {

		$db = null;
		try {
			$db = new SQLite3('../db.sqlite');
			// Get counter from db
			$statement = $db->prepare('SELECT * FROM USERS WHERE ID = :counterId');
			$statement->bindValue(":counterId", $counterId, SQLITE3_INTEGER);
			$result = $statement->execute();

			if ($result === false) {
				throw new Error($db->lastErrorCode(), $db->lastErrorCode());
			}

			$counter = $result->fetchArray(SQLITE3_ASSOC);

			if (!$counter) {
				throw new Error('Parameter counterId wrong');
			}

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
					$ticket_to_serve = $queue[0];

					// Update selected ticket on db
					$statement = $db->prepare('UPDATE TICKETS SET COUNTER_ID = :counterId, TS_SERVED = :tsServed WHERE ID = :ticketId');
					$statement->bindValue(":counterId", $counterId, SQLITE3_INTEGER);
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
			if ($db)
				$db->close();
		}
	}
}

if (!function_exists("create_new_counter")) {

	/**
	 * Create a new counter. Will take informations from $_POST
	 * 
	 * @return void
	 */
	function create_new_counter($vars) {
		$counter_id = $_POST["counterID"];
		try {
			$db = new SQLite3("../db.sqlite");
			//checking if the counter exists
			$statement = $db->prepare("SELECT COUNT(*) FROM counters WHERE ID = :counterId");
			$statement->bindValue(":counterId", $counter_id, SQLITE3_INTEGER);
			$result = $statement->execute();

			if ($result === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			$value = $result->fetchArray(SQLITE3_NUM);

			if (intval($value[0]) > 0) {
				echo json_encode(array("success" => false, "reason" => "Counter with this ID already exists"));
				return;
			}

			//create the counter

			$services = $_POST["servicesIds"];
			if(!preg_match("/^([0-9]+,?)+[0-9]+$/i", $services)){
				echo json_encode(array("success" => false, "reason" => "Service IDs format is wrong"));
				return;
			}

			$statement = $db->prepare("INSERT INTO users (ID, comma_services) VALUES (:counterId, :comma_services)");
			$statement->bindValue(":counterId", $counter_id, SQLITE3_INTEGER);
			$statement->bindValue(":comma_services", $services, SQLITE3_TEXT);

			$result = $statement->execute();
			if ($result === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			echo json_encode(array("success" => true, "counterId" => $counter_id, "servicesIds" => explode(",", $services)));

			$db->close();
		} catch (Exception $e) {
			echo json_encode(array("success" => false, "reason" => $e->getMessage()));
		}
	}
}

if (!function_exists('delete_counter')){
	function delete_counter($vars){
		try{
			parse_str(file_get_contents("php://input"), $_DELETE);

			$db = new SQLite3("../db.sqlite");

			$statement = $db->prepare('DELETE FROM users WHERE ID=:counterid');
			$statement->bindValue(":counterId", $_DELETE["counterId"], SQLITE3_INTEGER);

			$result = $statement->execute();
			if ($result === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			echo json_encode(array('success' => true));

			$db->close();
		} catch (Exception $e){
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}

if(!function_exists('edit_counter')){
	function edit_counter(){
		try{
			parse_str(file_get_contents("php://input"), $_PATCH);

			if(!preg_match("/^([0-9]+,?)+[0-9]+$/i", $_PATCH["serviceIds"])){
				echo json_encode(array("success" => false, "reason" => "Service IDs format is wrong"));
				return;
			}

			$db = new SQLite3("../db.sqlite");

			$statement = $db->prepare('UPDATE TABLE users (comma_services) VALUES (:comma_services) WHERE ID=:counterid');
			$statement->bindValue(":counterId", $_PATCH["counterId"], SQLITE3_INTEGER);
			$statement->bindValue(":comma_services", $_PATCH["serviceIds"], SQLITE3_TEXT);

			$result = $statement->execute();
			if ($result === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			echo json_encode(array('success' => true));

			$db->close();
		} catch (Exception $e){
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}

if (!function_exists('list_served_tickets')) {
	function list_served_tickets($count) {
		$db = null;
		try {

			if ($count <= 0) {
				throw new Error("Parameter count is expected to be > 0");
			}

			$db = new SQLite3('../db.sqlite');

			// Extract queues length for each service
			$statement = $db->prepare('SELECT service_id, COUNT(*) as len FROM TICKETS	WHERE counter_id IS NULL AND ts_served IS NULL GROUP BY service_id');
			$result = $statement->execute();
			if ($result === false) {
				throw new Error($db->lastErrorCode(), $db->lastErrorCode());
			}

			$lengths = array();
			while ($s = $result->fetchArray(SQLITE3_ASSOC)) {
				$lengths[$s['service_id']] = $s['len'];
			}

			// Extract `count` last served tickets from db
			$statement = $db->prepare('SELECT ID, display_id, counter_id, service_id, ts_served FROM TICKETS WHERE ts_served IS NOT NULL AND counter_id IS NOT NULL ORDER BY ts_served DESC LIMIT :n');
			$statement->bindValue(":n", $count, SQLITE3_INTEGER);
			$result = $statement->execute();

			if ($result === false) {
				throw new Error($db->lastErrorCode(), $db->lastErrorCode());
			}

			$tickets = array();
			while ($t = $result->fetchArray(SQLITE3_ASSOC)) {
				// Rename fields to match endpoint definition
				$t['ticketId'] = $t['ID'];
				unset($t['ID']);

				$t['displayId'] = $t['display_id'];
				unset($t['display_id']);

				$t['counterId'] = $t['counter_id'];
				unset($t['counter_id']);

				$t['serviceId'] = $t['service_id'];
				unset($t['service_id']);

				$t['timestampServed'] = $t['ts_served'];
				unset($t['ts_served']);

				// Add length of queue
				$t['queueLength'] = $lengths[$t['serviceId']];

				array_push($tickets, $t);
			}

			echo json_encode($tickets);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		} finally {
			if ($db)
				$db->close();
		}
	}
}

if (!function_exists("print_services")) {
	function print_services($vars) {
		try {
			$db = new SQLite3("../db.sqlite");

			$result = $db->query("SELECT * FROM services");

			if ($result === false) {
				throw new Error($db->lastErrorCode(), $db->lastErrorCode());
			}

			$ret = array();

			while ($value = $result->fetchArray(SQLITE3_ASSOC)) {
				$ret[] = array("serviceId" => $value["ID"], "serviceName" => $value["name"], "expectedSeconds" => $value["expected_s"]);
			}

			echo json_encode($ret);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}

if (!function_exists("print_counters")) {
	function print_counters($vars) {
		try {
			$db = new SQLite3("../db.sqlite");

			$result = $db->query("SELECT * FROM users");

			if ($result === false) {
				throw new Error($db->lastErrorCode(), $db->lastErrorCode());
			}

			$ret = array();

			while ($value = $result->fetchArray(SQLITE3_ASSOC)) {
				$ret[] = array("counterId" => $value["ID"], "serviceIds" => explode(",", $value["comma_services"]));
			}

			echo json_encode($ret);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}

/*Documentation for FastRoute can be found here: https://github.com/nikic/FastRoute */

//define the routes
$dispatcher = FastRoute\simpleDispatcher(function (FastRoute\RouteCollector $r) {
	$r->addRoute('POST', API_PATH . "/ticket", "create_new_ticket");
	$r->addRoute('GET', API_PATH . '/ticket', 'get_tickets');

	$r->addRoute('POST', API_PATH . '/counter', 'create_new_counter');
	$r->addRoute('PATCH', API_PATH . '/counter', 'edit_counter');
	$r->addRoute('DELETE', API_PATH . '/counter', 'delete_counter');
	$r->addRoute('GET', API_PATH . '/counters', 'print_counters');

	$r->addRoute('GET', API_PATH . '/services', 'print_services');
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
