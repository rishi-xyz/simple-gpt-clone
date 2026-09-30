// Run me:  bun playground/03-async.js
// Phase 02 · callbacks -> promises -> async/await

console.log("1. start");

setTimeout(() => console.log("3. one second later (callback)"), 1000);

console.log("2. this runs BEFORE the callback — JS did not wait");

async function getUser(username) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error(`GitHub said ${res.status}`);
    const user = await res.json();
    return `${user.name} has ${user.public_repos} public repos`;
  } catch (err) {
    return `failed: ${err.message}`;
  }
}

console.log("4.", await getUser("torvalds"));
console.log("5.", await getUser("this-user-does-not-exist-xyz"));
