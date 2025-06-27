import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);


(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        console.log(commandsData);
        await rest.put(
            Routes.applicationCommands(config.APPLICATION_ID),
            {
                body: commandsData,
            }
        );
        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();
