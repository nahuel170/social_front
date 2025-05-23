import React from 'react'
import { Nav } from './Nav'
import App from './../../../App';

export const Header = () => {
    return (
        <header className="layout__navbar">

            <div className="navbar__header">
                <a href="#" className="navbar__title">SocialApp</a>
            </div>

            <Nav/>

        </header>
    )
}
