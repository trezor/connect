## Path
- `path` - `string | Array<number>` in [BIP32]() format or `Array` of hardended numbers.
### Examples
Bitcoin account 1
`"m/49'0/'0'"`
<br>
`[49 | 0x80000000 >>> 0, 0 | 0x80000000 >>> 0, 0 | 0x80000000 >>> 0]`
