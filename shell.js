(() => {
    "use strict";

    const term = document.getElementById("term");
    const content = document.getElementById("content");
    const input = document.getElementById("input");

    const filesystem = {
        home: {
            __typ: "directory",
            __perm: false,
            user: {
                __typ: "directory",
                __perm: true,
                file: {
                    __typ: "file",
                    __perm: true,
                    content: "Hello, world!"
                }
            }
        }
    }

    const environment = {

    }

    const workingdir = filesystem.home.user

    let redirect = undefined

    const print = (wr) => {
        if (redirect) {
            redirect.content += wr
        } else {
            term.innerText += wr
        }
    }

    const resolvePath = (path) => {
        let currentPath = filesystem;

        if (path[0] !== '/') {
            currentPath = workingdir
        }

        for (let x of path.split('/')) {
            if (x.startsWith("__")) {
                return 0;
            }

            if (x === '.' || x === '') {
                continue;
            }

            let currentPath = filesystem[x]

            if (currentPath === undefined) {
                return 0;
            }
        }

        if (!currentPath.__perm) {
            return 1;
        }

        return currentPath;
    }

    const commands = {
        echo: (argv) => {
            print(argv.slice(1).join(' ') + '\n');
            return 0;
        },
        ls: (argv) => {
            let path

            if (argv.length === 1) {
                path = workingdir
            } else {
                path = resolvePath(argv[1])
            }

            if (path === 0) {
                print(`ls: cannot access ${argv[1]}: No such file or directory\n`)
                return 2;
            } else if (path === 1) {
                print(`ls: cannot access ${argv[1]}: Permission denied\n`)
                return 2;
            }

            for (let x in path) {
                if (x.startsWith("__")) {
                    continue
                }

                print(x + '\n')
            }

            return 0;
        }
    }

    input.addEventListener("keyup", ({key}) => {
        if (key === "Enter") {
            console.log(input.innerText)
            const argv = input.innerText.trim().split(' ')

            if (argv.includes('>')) {

            }

            term.innerHTML += `[user@localhost ~]$ ${input.innerText}<br>`;

            if (!Object.getOwnPropertyNames(commands).includes(argv[0])) {
                term.innerHTML += argv[0] + ": command not found\n";
                environment['?'] = 127;
            } else {
                environment['?'] = commands[argv[0]](argv);
            }

            input.innerText = "";
            input.focus();
            content.scroll(0, content.scrollHeight);
        }
    })
})()