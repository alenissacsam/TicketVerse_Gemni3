# Ticketverse 🎫

Ticketverse is a next-generation NFT ticketing marketplace built with Next.js, ensuring secure, transparent, and unforgettable event experiences.

## 🚀 Features

### 🎨 Dynamic UI & UX
- **Immersive Landing Page**: Features a custom shader-based background (`ColorBends`), smooth scroll animations (`VelocityScroll`), and a premium "White Glass Pill" aesthetic.
- **Trending Carousel**: A smooth, physics-based carousel (`useSpring`) for browsing hot events, supporting both wheel scroll and touch drag.
- **Protocol Transparency**: An interactive `LayoutGrid` section explaining the blockchain technology behind the platform (Minting, Privacy, Escrow, Resale).
- **Ambient Lighting**: Dynamic gradient lighting effects that react to content.

### 🛡️ Admin & Security
- **Admin Access Control**: Wallet-based authentication restricted to authorized admin addresses.
- **Database Management**: Admin dashboard for managing events and clearing database state.
- **IPFS Integration**: Infrastructure for exporting and storing event metadata on IPFS (InterPlanetary File System).

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://greensock.com/gsap)
- **3D & Shaders**: [Three.js](https://threejs.org/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- **Database**: [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Web3**: [Wagmi](https://wagmi.sh/), [Viem](https://viem.sh/)

## 🏁 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Environment Variables**:
    Copy `.env.example` to `.env` and fill in your database URL and other secrets.
4.  **Run Database Migrations**:
    ```bash
    npx prisma db push
    ```
5.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

## 🔑 Admin Access

The admin dashboard is located at `/admin`.
**Admin Wallet**: `0x3706a57b29615f9af745470990e52f420ffd1fb5`

---

Built with ❤️ for the future of ticketing.
