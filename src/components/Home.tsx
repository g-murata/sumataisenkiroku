import { useState } from 'react';
import { Header } from '../components/Header';
import { Charactar } from './Charactar';
import { Footer } from '../components/Footer';


export const Home = () => {
  return (
    <>
      {/* <Header /> */}
      <Charactar />
      <Footer />
    </>
  )
}