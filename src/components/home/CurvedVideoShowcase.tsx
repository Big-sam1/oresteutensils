import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';
import './CurvedShowcase.css';

import video1 from '../images/1.mp4';
import video2 from '../images/2.mp4';
import video3 from '../images/3.mp4';
import video4 from '../images/4.mp4';
import video5 from '../images/5.mp4';

interface Project {
  id: string;
  number: string;
  title: string;
  video: string;
  color?: string;
}

const projects: Project[] = [
  {
    id: 'p1',
    number: '#01',
    title: 'Strategy & Planning',
    video: video1,
  },
  {
    id: 'p2',
    number: '#02',
    title: 'Design & Development',
    video: video2,
  },
  {
    id: 'p3',
    number: '#03',
    title: 'Launch & Growth',
    video: video3,
  },
  {
    id: 'p4',
    number: '#04',
    title: 'Ongoing Support',
    video: video4,
  },
  {
    id: 'p5',
    number: '#05',
    title: 'Brand Showcase & Plating',
    video: video5,
  },
  {
    id: 'p6',
    number: '#06',
    title: 'Culinary Mastery',
    video: video1,
  },
  {
    id: 'p7',
    number: '#07',
    title: 'Tabletop Presentation',
    video: video2,
  },
];

export function CurvedVideoShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = projects.length;

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % total);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + total) % total);

  // Scroll slideshow effect: when user scrolls down, slide through projects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      // Map scroll progress (0 to 1) into active slide index
      const mappedIndex = Math.min(
        total - 1,
        Math.max(0, Math.floor(latest * (total + 1)))
      );
      setActiveIndex(mappedIndex % total);
    });
  }, [scrollYProgress, total]);

  // Determine positional CSS class for each card relative to activeIndex
  const getPositionClass = (index: number) => {
    let diff = index - activeIndex;

    // Wrap around calculation
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    switch (diff) {
      case 0:
        return 'position-center';
      case -1:
        return 'position-left';
      case -2:
        return 'position-left-medium';
      case -3:
        return 'position-left-far';
      case 1:
        return 'position-right';
      case 2:
        return 'position-right-medium';
      case 3:
        return 'position-right-far';
      default:
        return 'position-hidden';
    }
  };

  const activeProject = projects[activeIndex];

  return (
    <section ref={containerRef} className="design-section" aria-labelledby="curved-video-heading">
      {/* Background soft blur decorations */}
      <div className="background-decoration decoration-one" />
      <div className="background-decoration decoration-two" />

      {/* Header section matching provided CSS */}
      <div className="section-header-custom">
        <span className="eyebrow-custom">Behind the Designs</span>
        <h2 id="curved-video-heading">Curious What Else I’ve Created?</h2>
        <p>
          Explore more brand identities, packaging, and digital design work in my extended portfolio.
        </p>

        <Link to="/shop" className="portfolio-button">
          <span>See more Projects</span>
          <span className="button-arrow">→</span>
        </Link>
      </div>

      {/* Gallery wrapper with perspective and exact 3D positioning */}
      <div className="gallery-wrapper">
        {/* Navigation arrows */}
        <button
          type="button"
          onClick={prevSlide}
          className="gallery-arrow gallery-arrow-left"
          aria-label="Previous project"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="gallery-arrow gallery-arrow-right"
          aria-label="Next project"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        <div className="gallery">
          {projects.map((project, index) => {
            const posClass = getPositionClass(index);

            return (
              <div
                key={project.id}
                onClick={() => setActiveIndex(index)}
                className={`video-card ${posClass}`}
              >
                <div className="video-card-inner">
                  <video
                    src={project.video}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="project-video"
                  />
                  <div className="video-overlay" />
                  <div className="video-shine" />
                  <div className="video-card-content">{project.number}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project information below cards */}
      <div className="project-information">
        <div className="project-number">{activeProject.number}</div>
        <div className="project-title">{activeProject.title}</div>

        {/* Progress dots */}
        <div className="gallery-progress">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`progress-dot ${i === activeIndex ? 'active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Mute toggle button */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsMuted((m) => !m)}
          className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white/90 px-3 py-1 text-xs font-medium text-ink-700 shadow-sm transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300"
          aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
        >
          {isMuted ? (
            <>
              <VolumeXIcon className="h-3.5 w-3.5" />
              <span>Sound: Muted</span>
            </>
          ) : (
            <>
              <Volume2Icon className="h-3.5 w-3.5 text-brand-500" />
              <span>Sound: Playing</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
