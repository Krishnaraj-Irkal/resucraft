import React from 'react'
import { Helmet } from 'react-helmet-async'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import Testimonial from '../components/home/Testimonial'
import Footer from '../components/home/Footer'
import Banner from '../components/home/banner'
import CallToAction from '../components/home/CallToAction'

const Home = () => {
    return (
        <div>
            <Helmet><title>ResuCraft — Build Your Resume with AI</title></Helmet>
            <Banner />
            <Hero />
            <Features />
            <Testimonial />
            <CallToAction />
            <Footer />
        </div>
    )
}

export default Home