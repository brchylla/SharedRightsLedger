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

    let photographerRegistry = await getParticipantRegistry('org.artistrights.sample.Photographer');
    
    // changes model status in rights (in photo) from false to true
    transfer.photo.photoRights.model = true;

    // transfer photo from model's array to photographer's array
    

    // emit notifications that a transfer has occurred (photo, model and photographer)
    

    // persist the states of the photo, model, and photographer respectively


}

/**
 * Track the sale of a photo from a photographer to an agent
 * @param {org.artistrights.sample.sellToAgent} sellToAgent - the sale to be processed
 * @transaction
 */
async function sellPhotoToAgent(sale) {

    let photographerRegistry = await getParticipantRegistry('org.artistrights.sample.Photographer');
    let agentRegistry = await getParticipantRegistry('org.aristrights.sample.Agent');
    
    // assign the new owner of the photo
    sale.agent.photos.push(sale.photo);

    // emit a notification that a sale has occurred
    let photoSoldNotification = getFactory().newEvent('org.artistrights.sample', 'PhotoSoldNotification');
    photoSoldNotification.photo = sale.photo;
    emit(photoSoldNotification);

    // persist the states of the photographer and agent respectively
    await photographerRegistry.update(sale.photographer);
    await agentRegistry.update(sale.agent);

}

