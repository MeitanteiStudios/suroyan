
// Fetch here the trips of the user
const links = [
  {
    name: 'Japan Trip',
    href: '/dashboard/invoices',
  },
  { 
    name: 'Disney Cruise', 
    href: '/dashboard/customers' 
  },
];

export default function NavLinks() {
  return (
    <>
      {links.map((link) => {
        return (
          <a
            key={link.name}
            href={link.href}
            className="flex h-[48px] items-center gap-2 rounded-md text-sm font-medium hover:bg-sky-100 hover:text-blue-600 justify-start p-2 px-3"
          >
            <p className="block">{link.name}</p>
          </a>
        );
      })}
    </>
  );
}
