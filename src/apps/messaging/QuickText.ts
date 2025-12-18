export interface IQuickText {
    name: string,
    value: number, // Only use -1 for blank or skeleton messages (to not flag any template as being sent)
    text: string,
    sent?: boolean
}