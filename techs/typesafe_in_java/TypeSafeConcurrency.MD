# TypeSafeは並列処理と相性が良い

# Shared State

There are three ways to safely handle state…
– Don’t share
– Don’t mutate
– Coordinate access

The first two are far easier to get right than the third…
– Let’s try “don’t share”
– Partition the array in two chunks, and operate on them separately

