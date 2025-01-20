export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center items-center my-8">
      <div className=" w-full bg-base-100 shadow-xl border lg:w-1/2 drop-shadow-lg rounded shadow-slate-700 bg-gray-800">
        <div className="">{children}</div>
      </div>
    </div>
  );
}
