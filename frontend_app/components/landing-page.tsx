"use client";

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from '@/styles/landing.module.css'
import Loading from '@/components/loading'
import MermaidDiagram from '@/components/mermaid-diagram'

export function LandingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Preload fonts and icons
        if (typeof window !== "undefined") {
            Promise.all([
                document.fonts.ready
            ])
            .then(() => {
                // All resources loaded
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Resource loading error:", error);
                setIsLoading(false); // Show content even if there's an error
            });
        }
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    // Mermaid 图表内容
    const mermaidChart = `flowchart TD
    classDef user fill:#e3f2fd,stroke:#90caf9,color:#1e88e5,stroke-width:1px
    classDef webApp fill:#e8f5e9,stroke:#a5d6a7,color:#43a047,stroke-width:1px
    classDef storage fill:#f3e5f5,stroke:#ce93d8,color:#8e24aa,stroke-width:1px
    classDef function fill:#fff8e1,stroke:#ffe082,color:#ffa000,stroke-width:1px
    classDef ai fill:#e1f5fe,stroke:#81d4fa,color:#0288d1,stroke-width:1px
    classDef db fill:#fce4ec,stroke:#f48fb1,color:#d81b60,stroke-width:1px
    
    User(["User"])
    WebApp["Frontend Web App"]
    AppService["Backend App Service"]
    Blob["Blob Storage<br/>(Recordings)"]
    Function["Azure Function"]
    Speech["Speech-to-Text"]
    Transcripts["Blob Storage<br/>(Transcripts)"]
    Cosmos["CosmosDB"]
    GPT["Azure OpenAI GPT-4o"]
    Results["Blob Storage<br/>(Results)"]
    
    User -->|"Upload Audio"| WebApp
    WebApp -->|"Send File"| AppService
    AppService -->|"Store File"| Blob
    Blob -->|"Trigger"| Function
    Function -->|"Transcribe"| Speech
    Speech -->|"Return Text"| Function
    Function -->|"Store Transcript"| Transcripts
    Function -->|"Get Prompt"| Cosmos
    Function -->|"Summarize"| GPT
    GPT -->|"Return Summary"| Function
    Function -->|"Store Summary"| Results
    Function -->|"Update Status"| Cosmos
    WebApp -->|"Fetch Reports"| AppService
    AppService -->|"Fetch Metadata"| Cosmos
    User -->|"View Reports"| WebApp
    
    class User user
    class WebApp,AppService webApp
    class Blob,Transcripts,Results storage
    class Function function
    class GPT,Speech ai
    class Cosmos db`;

    return (
        <div className={styles.landingPage}>
            {/* Navigation */}
            <nav className={styles.nav}>
                <div className={`${styles.container} ${styles.navContainer}`}>
                    <div className={styles.logo}>
                        <i className="fas fa-microphone-alt"></i> VoiceMemo AI
                    </div>
                    <ul className={styles.navLinks}>
                        <li>
                            <a
                                href="/#features"
                                onClick={(e) => {
                                    if (window.location.pathname === "/") {
                                        e.preventDefault();
                                        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                                    }
                                }}
                            >
                                Features
                            </a>
                        </li>
                        <li>
                            <a
                                href="/#architecture"
                                onClick={(e) => {
                                    if (window.location.pathname === "/") {
                                        e.preventDefault();
                                        document.getElementById("architecture")?.scrollIntoView({ behavior: "smooth" });
                                    }
                                }}
                            >
                                Architecture
                            </a>
                        </li>
                        <li>
                            <a
                                href="/#process"
                                onClick={(e) => {
                                    if (window.location.pathname === "/") {
                                        e.preventDefault();
                                        document.getElementById("process")?.scrollIntoView({ behavior: "smooth" });
                                    }
                                }}
                            >
                                How It Works
                            </a>
                        </li>
                        <li>
                            <Link href="/audio-upload" className={styles.ctaButton}>
                                Get Started
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={styles.hero} id="home">
                <div className={`${styles.container} ${styles.heroContent}`}>
                    <h1 className={styles.fadeInUp}>
                        VoiceMemo AI: <span>Intelligent Voice Summarization System</span>
                    </h1>
                    <div className={`${styles.textBlock} ${styles.fadeInUp} ${styles.delay1}`}>
                        Transform your voice recordings into actionable insights with our cutting-edge AI-powered
                        summarization technology. Save time, capture key points, and never miss important details again.
                    </div>
                    <div className={`${styles.heroButtons} ${styles.fadeInUp} ${styles.delay2}`}>
                        <Link href="/audio-upload" className={styles.primaryButton}>
                            Try It Now <i className="fas fa-arrow-right"></i>
                        </Link>
                        <a href="#architecture" className={styles.secondaryButton}>
                            Learn More <i className="fas fa-info-circle"></i>
                        </a>
                    </div>
                    <div className={`${styles.serverStatusBanner} ${styles.fadeInUp} ${styles.delay3}`}>
                        <p>
                            <i className="fas fa-server"></i>{" "}
                            <span className={styles.statusOffline}>Server status: offline</span> •{" "}
                            <span className={styles.freeLabel}>Free for personal use</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features} id="features">
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>Key Features</h2>
                        <div className={styles.textBlock}>Discover how VoiceMemo AI can revolutionize the way you work with voice recordings</div>
                    </div>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <i className="fas fa-brain"></i>
                            </div>
                            <h3>AI-Powered Summarization</h3>
                            <div className={styles.textBlock}>
                                Our advanced GPT-4o AI technology extracts key insights and action items from your voice
                                recordings, giving you concise and accurate summaries.
                            </div>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <i className="fas fa-language"></i>
                            </div>
                            <h3>High-Precision Transcription</h3>
                            <div className={styles.textBlock}>
                                State-of-the-art speech-to-text technology ensures your voice recordings are transcribed
                                with exceptional accuracy in multiple languages.
                            </div>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <i className="fas fa-cloud"></i>
                            </div>
                            <h3>Secure Cloud Storage</h3>
                            <div className={styles.textBlock}>
                                All your recordings and summaries are securely stored in the cloud, allowing you to
                                access them anytime, anywhere, from any device.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section className={styles.architecture} id="architecture">
                <div className={styles.container}>
                    <div className={styles.architectureContent}>
                        <div className={styles.architectureText}>
                            <h2>System Architecture</h2>
                            <div className={styles.textBlock}>
                                VoiceMemo AI leverages Microsoft Azure's powerful cloud infrastructure to deliver a robust, scalable, and secure voice processing solution. Our architecture is designed for high performance and reliability. The system processes your voice recordings through multiple specialized components, from speech recognition to AI-powered summarization, all working together seamlessly to deliver actionable insights.
                            </div>
                        </div>
                        <div className={styles.architectureDiagram}>
                            <div className={styles.mermaidWrapper}>
                                <MermaidDiagram chart={mermaidChart} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className={styles.process} id="process">
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>How It Works</h2>
                        <div className={styles.textBlock}>The VoiceMemo AI system processes your recordings through a sophisticated pipeline</div>
                    </div>
                    <div className={styles.processSteps}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <div className={styles.stepContent}>
                                <h3>
                                    <i className="fas fa-upload"></i> Upload Recording
                                </h3>
                                <div className={styles.textBlock}>
                                    Simply upload your voice recording through our intuitive web interface. We support
                                    various audio formats including MP3, WAV, and M4A.
                                </div>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <div className={styles.stepContent}>
                                <h3>
                                    <i className="fas fa-server"></i> Processing Pipeline
                                </h3>
                                <div className={styles.textBlock}>
                                    Your recording is securely processed through our Azure-powered architecture, where
                                    it's stored and prepared for analysis.
                                </div>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <div className={styles.stepContent}>
                                <h3>
                                    <i className="fas fa-language"></i> Speech-to-Text Conversion
                                </h3>
                                <div className={styles.textBlock}>
                                    Using state-of-the-art speech recognition technology, we convert your audio into
                                    highly accurate text transcripts.
                                </div>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>4</div>
                            <div className={styles.stepContent}>
                                <h3>
                                    <i className="fas fa-brain"></i> AI Summarization
                                </h3>
                                <div className={styles.textBlock}>
                                    Our GPT-4o AI engine analyzes the transcript to extract key points, action items,
                                    and insights, creating a concise summary.
                                </div>
                            </div>
                        </div>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>5</div>
                            <div className={styles.stepContent}>
                                <h3>
                                    <i className="fas fa-file-alt"></i> Results Delivery
                                </h3>
                                <div className={styles.textBlock}>
                                    Access your transcript and AI-generated summary through our platform, or receive it
                                    via email for convenient reference.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className={`${styles.container} ${styles.ctaContent}`}>
                    <h2>Ready to Transform Your Voice Recordings?</h2>
                    <div className={styles.textBlock}>
                        Join thousands of professionals who are saving time and capturing more insights with VoiceMemo
                        AI.
                    </div>
                    <Link href="/audio-upload" className={styles.primaryButton}>
                        Get Started Today <i className="fas fa-rocket"></i>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.footerContent}>
                        <div className={styles.footerColumn}>
                            <h3>About VoiceMemo AI</h3>
                            <div className={styles.textBlock}>
                                VoiceMemo AI is a cutting-edge voice processing platform that transforms audio
                                recordings into actionable insights using advanced AI technology.
                            </div>
                            {/* <div className={styles.socialLinks}>
                                <a href="https://linkedin.com/in/ruit">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                                <a href="https://github.com/skymore/voice-memo-ai">
                                    <i className="fab fa-github"></i>
                                </a>
                            </div> */}
                        </div>
                        <div className={styles.footerColumn}>
                            <h3>Quick Links</h3>
                            <ul className={styles.footerLinks}>
                                <li>
                                    <a href="/">Home</a>
                                </li>
                                <li>
                                    <a href="https://ruit.me" target="_blank" rel="noopener noreferrer">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:realruitao@gmail.com">Support</a>
                                </li>
                            </ul>
                        </div>
                        <div className={styles.footerColumn}>
                            <h3>Contact Us</h3>
                            <ul className={styles.footerLinks}>
                                <li>
                                    <a href="mailto:realruitao@gmail.com">
                                        <i className="fas fa-envelope"></i> realruitao@gmail.com
                                    </a>
                                </li>
                                <li>
                                    <a href="https://linkedin.com/in/ruit" target="_blank" rel="noopener noreferrer">
                                        <i className="fab fa-linkedin"></i> LinkedIn
                                    </a>
                                </li>
                                <li>
                                    <a href="https://github.com/skymore/voice-memo-ai" target="_blank" rel="noopener noreferrer">
                                        <i className="fab fa-github"></i> GitHub
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles.copyright}>
                        <p>&copy; 2025 VoiceMemo AI. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
