export default function pickOne<T>(list: T[]) :T {
    return list[Math.floor(Math.random() * list.length)]
}