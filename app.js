            document.getElementById("taskForm").addEventListener("submit", function(e) {
                e.preventDefault(); // no need to recharge page
                // Get values
                const title = document.getElementById("title").value;
                const deadline = document.getElementById("deadline").value;

                // Crear objeto
                const task = {
                    title: title,
                    deadline: deadline
                };

                // Save in LocalStorage
                localStorage.setItem("task", JSON.stringify(task));

                console.log("Data saved");
            });