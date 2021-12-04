# GraphCMS Remix Starter

This is a basic auth (register/login/logout) starter for GraphCMS & Remix.

## Setup

<details>
 <summary>1. Create a GraphCMS project</summary>

[Login or Register](https://app.graphcms.com) for free, and create your first project.

</details>

<details>
 <summary>2. Create a model `AuthUser`</summary>

You'll need to add the following fields:

**Name**

- String / Single line text
- Required

**Email**

- String / Single line text
- Required
- Unique
- Read only

**Password**

- String / Single line text
- Required
- API only
</details>

<details>
 <summary>3. Create a Permanent Auth Token</summary>

Create an API token with ALL permissions to ALL models in ALL stages. **Set the default stage to DRAFT**.

</details>

<details>
 <summary>4. Add secrets to `.env`</summary>

Next add your API endpoint, token, and session secret to the file `.env`.

```dosini
GRAPHCMS_ENDPOINT=
GRAPHCMS_TOKEN=
SESSION_SECRET=
```

</details>
