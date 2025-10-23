export const DaoFactoryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "daoOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "signalRegistry",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadataCid",
        type: "string",
      },
    ],
    name: "DaoCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "initialSupply",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "metadataCid",
        type: "string",
      },
    ],
    name: "createDAO",
    outputs: [
      {
        internalType: "address",
        name: "tokenAddr",
        type: "address",
      },
      {
        internalType: "address",
        name: "registryAddr",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "daos",
    outputs: [
      {
        internalType: "address",
        name: "daoOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "signalRegistry",
        type: "address",
      },
      {
        internalType: "string",
        name: "metadataCid",
        type: "string",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
