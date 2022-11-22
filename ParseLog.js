const fs = require('fs');
const params = process.argv.slice(2);

fs.readFile(params[0], 'utf8', (err, rawContent) => {
    if (err) {
        console.error(err);
        return;
    }
    //console.log(data);
    const regex = /(?<host>.+)\s\[(?<date>.+)\]\s\"(?<method>\w+)\s((?<url>.+)\s(?<protocol>\w+)\/(?<version>.+)|(?<fullUrl>.+))\"\s(?<code>\d+)\s(?<bytes>\d+|\-)/gm;

    const result = Array.from(rawContent.matchAll(regex));

    const data = result.map(match => {
        const groups = match?.groups;
        if (groups) {
            const dateParts = groups["date"].split(":");

            return {
                host: groups["host"],
                datetime: {
                    day: dateParts[0],
                    hour: dateParts[1],
                    minute: dateParts[2],
                    second: dateParts[3]
                },
                request: {
                    method: groups["method"],
                    url: groups["url"] || groups["fullUrl"],
                    protocol: groups["protocol"] || "",
                    protocol_version: groups["version"] || ""
                },
                response_code: groups["code"],
                document_size: Number(groups["bytes"])
            }
        } else return {
            host: "",
            datetime: {
                day: "",
                hour: "",
                minute: "",
                second: ""
            },
            request: {
                method: "",
                url: "",
                protocol: "",
                protocol_version: ""
            },
            response_code: "200",
            document_size: 0
        };
    });

    var jsonContent = JSON.stringify(data);
    //console.log(jsonContent);

    fs.writeFile("output.json", jsonContent, 'utf8', function(err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });

});
