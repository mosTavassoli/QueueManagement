import Counter from './Counter';
const baseURL = "/api";

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
    if(response.ok){
        return countersJson.map((c) => new Counter(c.counterId,c.serviceId));
    } else {
        let err = {status: response.status, errObj:countersJson};
        throw err;  // An object with the error coming from the server
    }
}

//Request new tocket to service (as customer)


//Get ticket from queue to serve (as counter officer)
async function getTicketToServe(counterId){
    let url = '/ticket'
    if(counterId){
        const queryParams = "?toserve&counterId=" + counterId;
        url += queryParams;
    }
    const response = await fetch(baseURL + url);
    const ticketJson = await response.json();
    if(response.ok){
        console.log(ticketJson);
        return ticketJson;
    } else {
        let err = {status: response.status, errObj:ticketJson};
        throw err;  // An object with the error coming from the server
    }

}


//Get list of tickets served (as public screen)


//Modify a counter (as administrator)


//Create a new counter (as administrator)


const API = {getCounters, getTicketToServe} ;
export default API;
