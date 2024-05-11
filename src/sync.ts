/* eslint-disable class-methods-use-this */
import { DurableObject } from "cloudflare:workers";

export class WebMultiViewSync extends DurableObject {
  async getCounterValue() {
    const value = await this.ctx.storage.get<number>("value");

    return value || 0;
  }

  async increment(amount = 1) {
    let value: number = (await this.ctx.storage.get("value")) || 0;
    value += amount;
    await this.ctx.storage.put("value", value);

    return value;
  }

  async decrement(amount = 1) {
    let value: number = (await this.ctx.storage.get("value")) || 0;
    value -= amount;
    await this.ctx.storage.put("value", value);

    return value;
  }

  async reset() {
    await this.ctx.storage.delete("value");
  }
}
