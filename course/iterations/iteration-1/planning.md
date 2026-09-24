# Iteration 1 Planning

## Iteration Goal

We will make the existing pain assessment's 3D body map easier for clients to use. A client will start with a familiar body area, see that area highlighted on the model, explore its muscles, choose a specific muscle and side where applicable, and send that selection with the assessment. We will keep the static site testable and document its behavior and limits.

## Sponsor Planning Notes

We met with our sponsor, Mia Miller, on **September 4** and **September 16, 2026**. We also proposed the body map flow by email, and Mia replied, “The flow sounds good to me.”

### September 4 meeting

- **Body map:** Mia explained that clients usually know a familiar area, such as a shoulder, hip, hand, or wrist, but may not know muscle names. We planned to let them choose an area first and explore its muscles on the interactive model. We want the flow to work both independently and when Mia guides a client at a pop-up event.
- **Assessment delivery:** Mia told us submissions were producing an error and the expected EmailJS alert was not arriving. We prioritized restoring the existing email flow over building a new database.
- **Scheduling:** Mia wanted clients who had already had a consultation to see other session choices after completing the assessment, rather than being routed only to the free consultation.
- **Other requests:** We discussed a home exercise program option and a QR code linking to the scheduling page. Mia will create MedBridge programs on her side. She did not ask us to build client sign-in for viewing past submissions.
- **Deployment:** Mia identified BigCommerce as the website platform, and we discussed the access needed to inspect and update the deployed site.

### Approved body map flow and September 16 meeting

In our email, we proposed **Body Area → Muscles in that Area → Specific Muscle → Side → Submit**. We also described focusing the 3D model on the selected area and sending the body area, muscle, and side with the assessment. Mia approved this flow in her reply. We have not recorded the email date here.

At our September 16 meeting, we investigated the EmailJS failure and found a mismatch involving the deployed public key. We needed Bluehost access to update the deployment. We had BigCommerce access, and Mia said she would look into Bluehost access. Mia also confirmed that the post-assessment Calendly route showed only the free consultation even though other session types were already in her Calendly account.

## Planned Work and Owners

We selected these Issues for Iteration 1 and assigned one owner to each.

| Issue | What the issue is about | Assignee |
| --- | --- | --- |
| [#42](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/42) | Clean up the body-map code | Girwan Dhakal |
| [#43](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/43) | Create the supported body-area list | Girwan Dhakal |
| [#44](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/44) | Create the body-map muscle catalog | Girwan Dhakal |
| [#45](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/45) | Map muscles to familiar body areas | Lily Oswald |
| [#46](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/46) | Add body-area selection controls | Lily Oswald |
| [#47](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/47) | Focus the 3D model on the selected area | Lily Oswald |
| [#48](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/48) | Guide visual pain-location selection | Jay Roy |
| [#49](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/49) | Add muscle selection and model highlighting | Jay Roy |
| [#50](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/50) | Limit muscle search to the selected area | Jay Roy |
| [#51](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/51) | Save body area, muscle, and side in the form | Jay Roy |
| [#61](https://github.com/Naturallee-Goode/Paid-Pain-Assessment/issues/61) | Add EmailJS test credentials to the test site | Griffen Bon |

## Planning Snapshot

Our [Current Iteration — planning snapshot](https://github.com/orgs/Naturallee-Goode/projects/1/views/3) GitHub Project view records the selected work and owners.
