import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Mojo — Skill Tree',description:'Jelajahi skill, temukan langkah berikutnya, dan tumbuh bersama Mojo.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="id"><body>{children}</body></html>}
