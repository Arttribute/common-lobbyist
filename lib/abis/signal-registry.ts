export const SignalRegistryAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "daoOwner",
        type: "address",
      },
      {
        internalType: "contract IERC20",
        name: "token_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "cidHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "userRawAfter",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "userSqrtAfter",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalRawAfter",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalQuadAfter",
        type: "uint256",
      },
    ],
    name: "Signaled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "cidHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "userRawAfter",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "userSqrtAfter",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalRawAfter",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalQuadAfter",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
    ],
    name: "cidHashOf",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "cidHash",
        type: "bytes32",
      },
    ],
    name: "getMemoryByHash",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "cid",
            type: "string",
          },
          {
            internalType: "address",
            name: "dao",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "totalRaw",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalQuadWeight",
            type: "uint256",
          },
          {
            internalType: "uint32",
            name: "supporters",
            type: "uint32",
          },
          {
            internalType: "bool",
            name: "exists",
            type: "bool",
          },
        ],
        internalType: "struct SignalRegistry.MemoryAggregate",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "memories",
    outputs: [
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "totalRaw",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalQuadWeight",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "supporters",
        type: "uint32",
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
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "positions",
    outputs: [
      {
        internalType: "uint256",
        name: "rawAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "sqrtWeight",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "signal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
