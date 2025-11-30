import Link from 'next/link'

export default function ExternalLink({ href, children, className }:{ href:string, children:React.ReactNode, className?:string }){
  if (href.startsWith('http')) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
  }
  return <Link href={href} className={className}>{children}</Link>
}
