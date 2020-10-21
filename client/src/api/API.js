import Counter from "./Counter";
import Ticket from "./Ticket";
const baseURL = "/API/REST.php";

// async function isAuthenticated(){
//     let url = "/user";
//     const response = await fetch(baseURL + url);
//     const userJson = await response.json();
//     if(response.ok){
//         return userJson;
//     } else {
//         let err = {status: response.status, errObj:userJson};
//         throw err;  // An object with the error coming from the server
//     }
// }

//Returns list of counters with the services they are associated with
async function getCounters() {
  let url = "/counters";
  const response = await fetch(baseURL + url);
  const countersJson = await response.json();
  if (response.ok) {
    return countersJson.map((c) => new Counter(c.counterId, c.serviceId));
  } else {
    let err = { status: response.status, errObj: countersJson };
    throw err; // An object with the error coming from the server
  }
}

//Request new tocket to service (as customer)
async function getTicket(serviceId) {
  // return a new promise.
  return new Promise(function (resolve, reject) {
    // do the usual XHR stuff
    var req = new XMLHttpRequest();
    let url = baseURL + "/ticket";
    let data = `serviceID=${serviceId}`;
    req.open("post", url);
    //NOW WE TELL THE SERVER WHAT FORMAT OF POST REQUEST WE ARE MAKING
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.onload = function () {
      if (req.status == 200) {
        const response = req.response;
        let obj = JSON.parse(response);
        const ticket = new Ticket(obj.ticketId, obj.displayId, obj.serviceId, obj.queueLength, obj.success);
        resolve(ticket);
      } else {
        reject(Error(req.statusText));
      }
    };
    // handle network errors
    req.onerror = function () {
      reject(Error("Network Error"));
    }; // make the request
    req.send(data);
  });
}

//Get ticket from queue to serve (as counter officer)
async function getTicketToServe(counterId) {
  let url = "/ticket";
  if (counterId) {
    const queryParams = "?toserve&counterId=" + counterId;
    url += queryParams;
  }
  const response = await fetch(baseURL + url);
  const ticketJson = await response.json();
  if (response.ok) {
    console.log(ticketJson);
    return ticketJson;
  } else {
    let err = { status: response.status, errObj: ticketJson };
    throw err; // An object with the error coming from the server
  }
}

//Get list of tickets served (as public screen)

//Modify a counter (as administrator)

//Create a new counter (as administrator)

const API = { getCounters, getTicketToServe, getTicket };
export default API;
