// when ur profile name is way too long
export function shortenProfileName(name) {
  let nameTruncated = name;
  if (name.length > 40) {
    nameTruncated = name.slice(0, 40);
    return nameTruncated += "…";
  }
}
