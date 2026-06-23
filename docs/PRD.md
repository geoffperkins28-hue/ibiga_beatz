# PRD — Ibiga Beatz

## Product Name

Ibiga Beatz

## Product Vision

Ibiga Beatz is a platform that helps music producers showcase their portfolio, sell beats, accept custom beat requests, manage clients, and grow their music business from a single platform.

The platform consists of two major sections:

1. Public Website (accessible to everyone)
2. Producer Dashboard (accessible only to the producer)

The goal is to give music producers a professional online presence while providing tools to manage and monetize their services.

---

# User Roles

## Public User

Can:

* Browse producer profile
* Listen to beat previews
* View producer portfolio
* Listen to songs produced by the producer
* Purchase beats
* Submit custom beat requests
* Book studio sessions or consultations
* Contact producer

Cannot:

* Access dashboard
* Edit content
* View client information
* View sales data

---

## Producer (Admin)

Can:

* Edit profile
* Upload beats
* Manage portfolio
* Manage custom requests
* Manage bookings
* Manage customers
* View analytics
* Update public content

---

# Public Website

## Home Page

Display:

* Producer profile photo
* Producer bio
* Producer tagline
* Featured beats
* Latest work
* Call-to-action buttons

Buttons:

* Buy Beats
* Request Custom Beat
* Book Session

---

## Producer Portfolio Page

Display:

* Producer biography
* Music experience
* Genres
* Services offered
* Achievements

Editable by producer from dashboard.

---

## Produced Songs Showcase

Purpose:
Allow visitors to hear songs the producer has worked on before buying services.

Producer can add:

* Spotify links
* Apple Music links
* YouTube links

System automatically creates embeddable players.

Visitors can:

* Listen without leaving the website
* Browse songs as a playlist

Fields:

* Song Title
* Artist Name
* Streaming Link
* Cover Art

---

## Beat Store

Producer can upload:

Fields:

* Beat Title
* Genre
* BPM
* Mood
* Price
* Beat Preview Audio
* Cover Artwork

Public users can:

* Search beats
* Filter by genre
* Filter by BPM
* Preview beats
* Purchase beats

---

## Custom Beat Request Page

Purpose:
Allow artists to request unique beats.

Form Fields:

Client Name
Email
Phone Number
Genre
Desired BPM
Mood
Reference Artist
Deadline
Budget

Voice Idea Upload

User can:

* Record voice directly in browser
  OR
* Upload audio file

Example:
Artist hums melody or rhythm idea.

Producer receives:

* Form details
* Voice recording
* Request notification

Status Flow:

* New Request
* Under Review
* Accepted
* In Progress
* Completed

---

## Booking Page

Services:

* Studio Session
* Beat Production
* Mixing
* Mastering
* Consultation

Fields:

* Name
* Email
* Phone
* Service Type
* Preferred Date
* Notes

Bookings appear inside producer dashboard.

---

# Producer Dashboard

Authentication Required

Only producer can access.

---

## Dashboard Overview

Show:

* Total Beat Sales
* Total Orders
* Custom Beat Requests
* Bookings
* Recent Customers

---

## Beat Management

Producer can:

Create Beat
Edit Beat
Delete Beat
Mark Beat as Sold

Upload:

* Audio Preview
* Artwork
* Metadata

---

## Portfolio Management

Producer can:

Edit Bio
Update Profile Image
Add Achievements
Add Services
Manage Social Links

---

## Produced Songs Management

Producer can:

Add Spotify Link
Add Apple Music Link
Add YouTube Link

System generates embedded player automatically.

Producer can:

* Reorder songs
* Remove songs
* Feature songs

---

## Client Management (Mini CRM)

Store:

Client Name
Email
Phone Number
Orders
Total Spending
Notes

Producer can:

* Search customers
* View history
* Add notes

---

## Custom Beat Requests

View all incoming requests.

Each request contains:

* Client Details
* BPM
* Genre
* Budget
* Voice Recording

Producer can update status:

New
Accepted
Rejected
In Progress
Completed

---

## Booking Management

View all bookings.

Actions:

* Accept
* Reschedule
* Cancel
* Complete

---

# Payments

Phase 1

Support:

* Paystack
* Flutterwave

Requirements:

* Secure checkout
* Payment confirmation
* Order history

After payment:

* Customer receives confirmation
* Producer receives notification

---

# Notifications

Send notifications for:

* New beat purchase
* New booking
* New custom beat request

Methods:

* Email
* Dashboard notification

---

# Technical Stack

Frontend:

* Next.js
* TypeScript
* TailwindCSS
* Shadcn UI

Backend:

* Supabase

Authentication:

* Supabase Auth

Database:

* PostgreSQL (Supabase)

Storage:

* Supabase Storage

Payments:

* Paystack
* Flutterwave

Audio:

* HTML5 Audio Player

Embedded Music:

* Spotify Embed
* Apple Music Embed
* YouTube Embed

---

# MVP Scope (Version 1)

Must Build:

1. Public Producer Website
2. Beat Store
3. Produced Songs Showcase
4. Custom Beat Request with Voice Recording
5. Booking System
6. Producer Dashboard
7. Client CRM
8. Payment Integration
9. Authentication
10. Notifications

Anything not listed above should be considered out of scope for Version 1.
