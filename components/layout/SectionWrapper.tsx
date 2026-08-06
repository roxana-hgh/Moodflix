
interface Iprops {
   children: React.ReactNode;
}

function SectionWrapper({ children }: Iprops) {
    return ( 
        <section className="py-10 lg:py-15 ">
            {children}
        </section>
     );
}

export default SectionWrapper;