export const capitalise = word => word[0].toUpperCase() + word.substr(1)
export const titleify = word => word.split('_').map(capitalise).join(' ')
