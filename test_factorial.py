import factorial


def test_small():
    assert factorial.factorial_iter(0) == 1
    assert factorial.factorial_iter(5) == 120
    assert factorial.factorial_rec(5) == 120


if __name__ == "__main__":
    test_small()
    print("All tests passed")
