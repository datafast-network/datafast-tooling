import { ascTypeForProtocol, valueTypeForAsc } from '../codegen/types'
import * as util from '../codegen/util'

const abiEvents = abi =>
  util.disambiguateNames({
    values: abi.data.filter(item => item.get('type') === 'event'),
    getName: event => event.get('name'),
    setName: (event, name) => event.set('_alias', name),
  })

const protocolTypeToGraphQL = (protocol, name) => {
  let ascType = ascTypeForProtocol(protocol, name)
  return valueTypeForAsc(ascType)
}

const generateField = ({ name, type, protocolName }) =>
  `${name}: ${protocolTypeToGraphQL(protocolName, type)}! # ${type}`

const generateEventFields = ({ index, input, protocolName }) =>
  input.type == 'tuple'
    ? util
        .unrollTuple({ value: input, path: [input.name || `param${index}`], index })
        .map(({ path, type }) =>
          generateField({ name: path.join('_'), type, protocolName }),
        )
    : [
        generateField({
          name: input.name || `param${index}`,
          type: input.type,
          protocolName,
        }),
      ]

const generateEventType = (event, protocolName) => `type ${
  event._alias
} @entity(immutable: true) {
      id: Bytes!
      ${event.inputs
        .reduce(
          (acc, input, index) =>
            acc.concat(generateEventFields({ input, index, protocolName })),
          [],
        )
        .join('\n')}
      blockNumber: BigInt!
      blockTimestamp: BigInt!
      transactionHash: Bytes!
    }`

const generateExampleEntityType = (protocol, events) => {
  if (protocol.hasABIs() && events.length > 0) {
    return `type ExampleEntity @entity {
  id: Bytes!
  count: BigInt!
  ${events[0].inputs
    .reduce(
      (acc, input, index) =>
        acc.concat(generateEventFields({ input, index, protocolName: protocol.name })),
      [],
    )
    .slice(0, 2)
    .join('\n')}
}`
  } else {
    return `type ExampleEntity @entity {
  id: ID!
  block: Bytes!
  count: BigInt!
}`
  }
}

export {
  abiEvents,
  protocolTypeToGraphQL,
  generateField,
  generateEventFields,
  generateEventType,
  generateExampleEntityType,
}