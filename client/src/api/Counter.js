class Counter {
  constructor(counterId, serviceId) {
    this.counterId = counterId;
    this.serviceId = serviceId;
  }

  /**
   * Construct a Counter from a plain object
   * @param {{}} json
   * @return  Counter} the newly created Counter object
   */
  static from(json) {
    const c = Object.assign(new Counter(), json);
    return c;
  }
}

export default Counter;
