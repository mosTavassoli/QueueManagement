<?php
require_once "../vendor/autoload.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json");

define("API_PATH", "/API/REST.php");

define("START_OF_DISPLAY_ID", 1); //this is the display id that will be used as start each day

/* Functions that implements endpoints */
if(!function_exists("create_new_ticket")){

	/**
	 * Create a new ticket. Will take informations from $_POST
	 * 
	 * @return void
	 */
	function create_new_ticket($vars){
		$service_id = $_POST["serviceID"];
		try{
			$db = new SQLite3("../db.sqlite");
			//checking if the service exists
			$statement = $db->prepare("SELECT COUNT(*) FROM services WHERE ID = :serviceId");
			$statement->bindValue(":serviceId", $service_id, SQLITE3_INTEGER);
			$result = $statement->execute();

			if($result === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			$value = $result->fetchArray(SQLITE3_NUM);

			if(intval($value[0]) <= 0){
				echo json_encode(array("success" => false, "reason" => "Service not available"));
				return;
			}

			//getting the most recent display_id. This way is definitely not parallel safe
			//but using SQLite means you don't give a single f* of parallelism
			
			$value = $db->querySingle("SELECT ts_create, display_id FROM tickets ORDER BY ts_create DESC LIMIT 1", true);
			if($value === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			if(empty($value)) $new_ticket_display_id = START_OF_DISPLAY_ID;
			else{
				$last_ticket_date = date("Y-m-d", $value["ts_create"]);
				$new_ticket_display_id = $last_ticket_date != date("Y-m-d") ? START_OF_DISPLAY_ID : intval($value["display_id"]) + 1 ;
			}

			//create the ticket

			$statement = $db->prepare("INSERT INTO tickets (display_id, service_id, ts_create) VALUES (:displayId, :serviceId, :creationTs)");
			$statement->bindValue(":displayId", $new_ticket_display_id, SQLITE3_INTEGER);
			$statement->bindValue(":serviceId", $service_id, SQLITE3_INTEGER);
			$statement->bindValue(":creationTs", time(), SQLITE3_INTEGER);
			$result = $statement->execute();
			if($result === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			//getting the length of the queue
			//checking if the service exists
			$statement = $db->prepare("SELECT COUNT(*) FROM tickets WHERE service_id = :serviceId AND ts_served IS NULL");
			$statement->bindValue(":serviceId", $service_id, SQLITE3_INTEGER);
			$result = $statement->execute();

			if($result === false) throw new Error($db->lastErrorCode(), $db->lastErrorCode());

			$value = $result->fetchArray(SQLITE3_NUM);
			$queue_length = $value[0];

			echo json_encode(array("success" => true, "displayId" => $new_ticket_display_id, "ticketId" => $db->lastInsertRowID(), "serviceId" => intval($service_id), "queueLength" => $queue_length));

			$db->close();
		}
		catch(Exception $e){
			echo json_encode(array("success" => false, "reason" => $e->getMessage()));
		}
	}
}

/*Documentation for FastRoute can be found here: https://github.com/nikic/FastRoute */

//define the routes
$dispatcher = FastRoute\simpleDispatcher(function(FastRoute\RouteCollector $r){
	$r->addRoute('POST', API_PATH."/ticket", "create_new_ticket");
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
?>
