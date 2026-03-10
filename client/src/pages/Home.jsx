import React from 'react'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import Testimonial from '../components/home/Testimonial'
import Footer from '../components/home/Footer'
import Banner from '../components/home/banner'
import CallToAction from '../components/home/CallToAction'

const Home = () => {
    return (
        <div>
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