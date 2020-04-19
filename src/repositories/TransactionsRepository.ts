import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const balance = transactions.reduce(
      (accumulator: Balance, transactionType: Transaction) => {
        if (transactionType.type === 'income') {
          accumulator.income += transactionType.value * 1;
        } else if (transactionType.type === 'outcome') {
          accumulator.outcome += transactionType.value * 1;
        }
        accumulator.total = accumulator.income - accumulator.outcome * 1;
        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
    return balance;
  }
}

export default TransactionsRepository;
