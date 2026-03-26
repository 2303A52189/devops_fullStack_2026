#!/usr/bin/env python3
"""Simple factorial calculator with CLI.

Provides iterative and recursive implementations.
"""
import argparse
import sys

def factorial_iter(n: int) -> int:
    if n < 0:
        raise ValueError("factorial() not defined for negative values")
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

def factorial_rec(n: int) -> int:
    if n < 0:
        raise ValueError("factorial() not defined for negative values")
    return 1 if n == 0 else n * factorial_rec(n - 1)

def parse_args(argv=None):
    p = argparse.ArgumentParser(description="Calculate factorial of a non-negative integer")
    p.add_argument("n", type=int, help="non-negative integer")
    p.add_argument("--method", choices=("iter", "rec"), default="iter", help="use iterative or recursive method")
    return p.parse_args(argv)

def main(argv=None):
    args = parse_args(argv)
    try:
        if args.method == "iter":
            print(factorial_iter(args.n))
        else:
            print(factorial_rec(args.n))
    except RecursionError:
        print(f"Error: recursion depth exceeded for n={args.n}", file=sys.stderr)
        raise
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(2)

if __name__ == "__main__":
    main()
