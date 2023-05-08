export default function Header({ photo }: { photo?: string | undefined }) {
  return (
    <header className="flex justify-between items-center w-full mt-5 border-b-2 pb-7 sm:px-4 px-2">
      <a href="/" className="flex space-x-2">
        <img
          alt="header text"
          src="/fpl.png"
          className="sm:w-12 sm:h-12 w-7 h-7"
          width={25}
          height={25}
        />
        <h1 className="sm:text-4xl text-2xl font-bold ml-2 tracking-tight">
          FPL Wrapped
        </h1>
      </a>
      {photo ? (
        <img
          alt="Profile picture"
          src={photo}
          className="w-10 rounded-full"
          width={32}
          height={28}
        />
      ) : (
        <a
          href="https://twitter.com/home"
          target="_blank"
          rel="noreferrer"
        >
          <img
            alt="IMG"
            src="/vercelLogo.png"
            className="sm:w-10 sm:h-[34px] w-8 h-[28px]"
            width={32}
            height={28}
          />
        </a>
      )}
    </header>
  );
}
