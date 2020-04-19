import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError(
        'The transaction cannot be concluded, you have no funds in your account',
      );
    }

    let hasCategoryTransaction = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!hasCategoryTransaction) {
      hasCategoryTransaction = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(hasCategoryTransaction);
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: hasCategoryTransaction,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
