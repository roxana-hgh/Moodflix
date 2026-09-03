
interface Iprops {
   children: React.ReactNode;
}

function SectionWrapper({ children }: Iprops) {
    return ( 
        <section className="py-5 lg:py-6 ">
            {children}
        </section>
     );
}

export default SectionWrapper;