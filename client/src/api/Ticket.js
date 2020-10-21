class Ticket {
    constructor(ticketId, displayId, serviceId, queueLength, success) {
      this.ticketId = ticketId;
      this.serviceId = serviceId;
      this.displayId = displayId;
      this.queueLength = queueLength;
      this.success = success;
    }
  
    /**
     * Construct a ticket from a plain object
     * @param {{}} json
     * @return  ticket} the newly created ticket object
     */
    static from(json) {
      const c = Object.assign(new Ticket(), json);
      return c;
    }
  }
  
  export default Ticket;