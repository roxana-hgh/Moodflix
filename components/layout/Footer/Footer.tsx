function Footer() {
    return ( 
        <div className="py-3 border-t">
            <div className="container mx-auto flex justify-center">
                <span className="text-[10px] text-muted-foreground">
                    &copy; {new Date().getFullYear()} MoodFlix. All rights reserved.
                </span>
            </div>
        </div>
     );
}

export default Footer;