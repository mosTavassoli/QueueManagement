import Service from "./Service";
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

//Returns list of services
async function getServices() {
  let url = "/services";
  const response = await fetch(baseURL + url);
  const serviceJson = await response.json();
  if (response.ok) {
    return serviceJson.map((s) => new Service(s.serviceId, s.serviceName));
  } else {
    let err = { status: response.status, errObj: serviceJson };
    throw err; // An object with the error coming from the server
  }
}

//Request new ticket to service (as customer)
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
      if (req.status === 200) {
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
    
    return ticketJson;
  } else {
    let err = { status: response.status, errObj: ticketJson };
    throw err; // An object with the error coming from the server
  }
}

//Get list of tickets served (as public screen)

async function getListOfServedTickets() {
    try {
      const response = await fetch(`${baseURL}/ticket?served`);
      const listServedTickets = await response.json();
      if (response.ok) {
        return listServedTickets[0];
      } else {
        return [];
      }
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  }


//Modify a counter (as administrator)

//Create a new counter (as administrator)


const API = {getServices, getTicketToServe, getListOfServedTickets,getTicket} ;
export default API;
