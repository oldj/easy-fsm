/**
 * index.ts
 */

import Machine from './Machine'
import { IMachineConfigs } from './types'

export default {
  create: (configs: IMachineConfigs) => new Machine(configs),
}
