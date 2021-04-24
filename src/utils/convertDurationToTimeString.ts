export function convertDurationToTimeString(duration: number) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    const timeString = [hours, minutes, seconds]
        .map(unit => String(unit).padStart(2, '0')) // iniciar sempre com 0 antes, 2 caracteres
        .join(':')

    return timeString;

}