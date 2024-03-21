/**
 * index.ts
 */

import Machine, { IMachineConfigs } from './Machine'

export default {
  create: (configs: IMachineConfigs) => new Machine(configs),
}
