import * as latest from 'baileys' // this is for latest version of baileys >=7
import past from 'baileys' // this is for old version of baileys <6
const baileys = latest.proto?.WebMessageInfo ? latest : past
export default baileys