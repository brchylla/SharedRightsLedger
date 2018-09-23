/**
 * Track the action of a photographer taking a photo
 * @param {org.artistrights.sample.takePhoto} takePhoto - the photo capture to be processed
 * @transaction
 */
async function takePhoto(capture) {
    
    let photoRegistry = await getAssetRegistry('org.artistrights.sample.Photo');
    let modelRegistry = await getParticipantRegistry('org.artistrights.sample.Model');
    
    let today = new Date();
    
    // create the photo JSON object and push to array of photos in model
    let factory = getFactory();
    let photo = factory.newResource('org.artistrights.sample', 'Photo', ('photo' + today));
    photo.date = today;
    photo.location = '';
    photo.photoModel = capture.photoModel;
    photo.photographer = capture.photographer;
    photo.photoRights = capture.photoRights;
    capture.photoModel.photos.push(photo);

    // emit a notification that photo has been taken
    let photoTakenNotification = getFactory().newEvent('org.artistrights.sample', 'PhotoTakenNotification');
    photoTakenNotification.photo = photo;
    emit(photoTakenNotification);

    // emit a notification that photo has been added to model
    let modelUpdatedNotification = getFactory().newEvent('org.artistrights.sample', 'ModelUpdatedNotification');
    modelUpdatedNotification.model = capture.photoModel;
    emit(modelUpdatedNotification);

    // persists the state of the photo
    await photoRegistry.add(photo);
    await modelRegistry.update(capture.photoModel);

}

/**
 * Track the modification of rights for a photo
 * @param {org.artistrights.sample.modifyRights} modifyRights - the rights modification to be processed
 * @transaction
 */
async function modifyRights(modifyRights) {
    
    let photoRegistry = await getAssetRegistry('org.artistrights.sample.Photo');
    
    // modify the rights of the photo
    modifyRights.photo.photoRights = modifyRights.rights;
    
    // emit a notification that rights have been modified
    let rightsModifiedNotification = getFactory().newEvent('org.artistrights.sample', 'RightsModifiedNotification');
    rightsModifiedNotification.rights = modifyRights.rights;
    emit(rightsModifiedNotification);

    // persists the state of the photo
    await photoRegistry.update(modifyRights.photo);

}

/**
 * Track the transfer of a photo to a photographer
 * @param {org.artistrights.sample.transferToPhotographer} transfer - the transfer to be processed
 * @transaction
 */
async function transferToPhotographer(transfer) {

    let modelRegistry = await getParticipantRegistry('org.artistrights.sample.Model');
    let photographerRegistry = await getParticipantRegistry('org.artistrights.sample.Photographer');
    let photoRegistry = await getAssetRegistry('org.artistrights.sample.Photo');
    
    // changes modelReleased status in rights (in photo) from false to true
    transfer.photo.photoRights.modelReleased = true;

    // delete photo from model's array
    transfer.model.photos.splice(transfer.model.photos.indexOf(transfer.photo), 1);

    // add photo to photographer's array
    transfer.photographer.photos.push(transfer.photo);

    // emit notification
    let photoTransferredNotification = getFactory().newEvent('org.artistrights.sample', 'PhotoTransferredNotification');
    photoTransferredNotification.model = transfer.model;
    photoTransferredNotification.photographer = transfer.photographer;
    photoTransferredNotification.photo = transfer.photo;
    emit(photoTransferredNotification);
    
    // persists the states of the assets and participants above
    await modelRegistry.update(transfer.model);
    await photographerRegistry.update(transfer.photographer);
    await photoRegistry.update(transfer.photo);

}

/**
 * Track the sale of a photo from a photographer to an agent
 * @param {org.artistrights.sample.sellToAgent} sellToAgent - the sale to be processed
 * @transaction
 */
async function sellToAgent(sale) {

    // if exclusivity is set to true, alert user that operation cannot be performed
    if (sale.photo.photoRights.exclusive) {
        let exclusiveFailNotification = getFactory().newEvent('org.artistrights.sample', 'ExclusiveFailNotification');
        emit(exclusiveFailNotification);
        return;
    }
    
    // add photo to agent's collection
    let agentRegistry = await getParticipantRegistry('org.artistrights.sample.Agent');
    sale.agent.photos.push(sale.photo);
    let agentUpdatedNotification = getFactory().newEvent('org.artistrights.sample', 'AgentUpdatedNotification');
    agentUpdatedNotification.agent = sale.agent;
    emit(agentUpdatedNotification);
    await agentRegistry.update(sale.agent);

}

