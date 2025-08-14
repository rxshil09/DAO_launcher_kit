if (typeof window !== 'undefined') {
    window.global = window;
    window.process = {
        env: { NODE_ENV: process.env.NODE_ENV }
    };
}
