
interface Iprops {
   children: React.ReactNode;
}

function SectionWrapper({ children }: Iprops) {
    return ( 
        <section className="py-6 lg:py-10 ">
            {children}
        </section>
     );
}

export default SectionWrapper;