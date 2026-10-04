import React from 'react';
import type { Metadata } from 'next';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'Espace Client & Commandes | NutriFitness.ch Genève',
  description: 'Gérez vos commandes, suivez vos colis PostPac Priority, vos points fidélité et vos adresses de livraison en Suisse.',
};

export default function AccountPage() {
  return <AccountClient />;
}
