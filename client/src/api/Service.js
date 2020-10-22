class Service {
  constructor(serviceId, serviceName) {
    this.serviceId = serviceId;
    this.serviceName = serviceName;
  }

  /**
   * Construct a Counter from a plain object
   * @param {{}} json
   * @return  Service} the newly created Service object
   */
  static from(json) {
    const c = Object.assign(new Service(), json);
    return c;
  }
}

export default Service;
