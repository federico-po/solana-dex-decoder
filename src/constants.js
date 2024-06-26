const {
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} = require("@exodus/solana-lib");

// fede;2!

// https://quote-api.jup.ag/v6/program-id-to-label
const PROVIDER_NAME_BY_ADDRESS = new Map([
  ["DSwpgjMvXhtGn6BsbqmacdBZyfLj6jSWf3HJpdJtmg6N", "Dexlab"],
  ["BSwp6bEBihVLdqJRKGgzjcGLHkcTuzmSo1TQkHepzH8p", "Bonkswap"],
  ["Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB", "Meteora"],
  ["FLUXubRmkEi2q6K3Y9kBPg9248ggaZVsoSFhtJHSrm1X", "FluxBeam"],
  ["HyaB3W9q6XdA5xwpU4XnSZV94htfmbmqJXZcEbRaJutt", "Invariant"],
  ["PERPHjGBqRHArX4DySjwM6UJHiR3sWAatqfdBS2qQJu", "Perps"],
  ["treaf4wWBBty3fHdyBpo35Mz84M8k3heKXmjmi9vFt5", "Helium Network"],
  ["DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1", "Orca V1"],
  ["CURVGoZn8zycx6FXwwevgBTB2gVvdbGTEpvMJDbgs2t4", "Aldrin V2"],
  ["LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", "Meteora DLMM"],
  ["PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY", "Phoenix"],
  ["SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr", "Saros"],
  ["AMM55ShdkoGRB5jVYPjWziwk8m5MpwyDgsMWHaMSQWH6", "Aldrin"],
  ["9tKE7Mbmj4mxDjWatikzGAtkoWosiiZX9y6J4Hfm2R8H", "Oasis"],
  ["MERLuDFBMmsHnsBPZw2sDQZHvXFMwp8EdjudcU2HKky", "Mercurial"],
  ["SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8", "Token Swap"],
  ["srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX", "Openbook"],
  ["CLMM9tUoggJu2wagPkkqs9eFG4BWhVBZWkP1qv3Sp7tR", "Crema"],
  ["DecZY86MU5Gj7kppfUCEmd4LbXXuyZH1yHaP2NTqdiZB", "Saber (Decimals)"],
  ["CTMAxxk34HjKWxQ3QLZK1HpaLXmBveao3ESePXbiyfzh", "Cropper"],
  ["CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", "Raydium CLMM"],
  ["whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", "Whirlpool"],
  ["PSwapMdSai8tjrEXcxFeQth87xC4rRsa4VA5mhGhXkP", "Penguin"],
  ["EewxydAPCCVuNEyrVN68PuSYdQ7wKn27V9Gjeoi8dy3S", "Lifinity V1"],
  ["C1onEW2kPetmHmwe74YC1ESx3LnFEpVau6g2pg4fHycr", "Clone Protocol"],
  ["2wT8Yq49kHgDzXuPxZSaeLaH1qbmGXtEyPy64bL7aD3c", "Lifinity V2"],
  ["Dooar9JkhdZ7J3LHN3A7YCuoGRUggXhQaG4kijfLGU2j", "StepN"],
  ["9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP", "Orca V2"],
  ["opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb", "OpenBook V2"],
  ["MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD", "Marinade"],
  ["GFXsSL5sSaDfNFQUYsHekbWBW1TsFdjDYzACh62tEHxn", "GooseFX"],
  ["SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ", "Saber"],
  ["stkitrT1Uoy18Dk1fTrgPw8W6MVzoCfYoAFT4MLsmhq", "Sanctum"],
  ["675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", "Raydium"],
]);

const JUPITER_V6_PROGRAM_ID = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";
const BUDGET_PROGRAM_ID = "ComputeBudget111111111111111111111111111111";

const KNOWN_PROGRAM_IDS = new Set([
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  BUDGET_PROGRAM_ID,
  JUPITER_V6_PROGRAM_ID,
]);

module.exports = {
  PROVIDER_NAME_BY_ADDRESS,
  KNOWN_PROGRAM_IDS,
  JUPITER_V6_PROGRAM_ID,
};
